import { fireEvent, render, screen } from '@testing-library/react';
import Onboarding from './Onboarding.tsx';

const fillName = () => {
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: ' Ana ' } });
  fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'García' } });
};

describe('Onboarding', () => {
  it('sends a property manager with their administration', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<Onboarding onSubmit={onSubmit} />);

    fillName();
    fireEvent.change(screen.getByLabelText('Nombre de la administración'), { target: { value: 'Admin Ana' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(onSubmit).toHaveBeenCalledWith({
      profileType: 'propertyManager',
      name: 'Ana',
      middleName: undefined,
      lastName: 'García',
      administrationName: 'Admin Ana',
      companyName: undefined,
      home: undefined,
      trades: undefined,
    });
  });

  it('sends a direct client with their home', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<Onboarding onSubmit={onSubmit} />);

    fireEvent.click(screen.getByLabelText('Particular'));
    fillName();
    fireEvent.change(screen.getByLabelText('Calle'), { target: { value: 'Av. Corrientes' } });
    fireEvent.change(screen.getByLabelText('Número'), { target: { value: '1234' } });
    fireEvent.change(screen.getByLabelText('Código postal'), { target: { value: 'C1043' } });
    fireEvent.change(screen.getByLabelText('Entre calles'), { target: { value: 'Talcahuano y Libertad' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        profileType: 'directClient',
        home: { street: 'Av. Corrientes', number: '1234', postalCode: 'C1043', intersection: 'Talcahuano y Libertad' },
      }),
    );
  });

  it('requires at least one trade for a tradesman', () => {
    const onSubmit = vi.fn();
    render(<Onboarding onSubmit={onSubmit} />);

    fireEvent.click(screen.getByLabelText('Profesional de oficio'));
    fillName();
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Elegí al menos un oficio.');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('sends the chosen trades', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<Onboarding onSubmit={onSubmit} />);

    fireEvent.click(screen.getByLabelText('Profesional de oficio'));
    fillName();
    fireEvent.click(screen.getByLabelText('Plomero'));
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ profileType: 'tradesman', trades: ['plumber'] }));
  });

  it('shows the API error', async () => {
    render(<Onboarding onSubmit={vi.fn().mockRejectedValue(new Error('lastName should not be empty'))} />);

    fillName();
    fireEvent.change(screen.getByLabelText('Nombre de la administración'), { target: { value: 'Admin Ana' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('lastName should not be empty');
  });
});
