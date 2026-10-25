import { fireEvent, render, screen } from '@testing-library/react';
import Onboarding from './Onboarding.tsx';

const fillName = () => {
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: ' Ana ' } });
  fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'García' } });
};

const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

describe('Onboarding', () => {
  it('sends a direct client with their home', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<Onboarding onSubmit={onSubmit} onSignOut={vi.fn()} />);

    fillName();
    fireEvent.change(screen.getByLabelText('Calle'), { target: { value: 'Av. Corrientes' } });
    fireEvent.change(screen.getByLabelText('Número'), { target: { value: '1234' } });
    fireEvent.change(screen.getByLabelText('Código postal'), { target: { value: 'C1043' } });
    fireEvent.change(screen.getByLabelText('Entre calles'), { target: { value: 'Talcahuano y Libertad' } });
    submit();

    expect(onSubmit).toHaveBeenCalledWith({
      profileType: 'directClient',
      name: 'Ana',
      middleName: undefined,
      lastName: 'García',
      home: { street: 'Av. Corrientes', number: '1234', postalCode: 'C1043', intersection: 'Talcahuano y Libertad' },
      trades: undefined,
    });
  });

  it('signs up a property manager without asking for their administration', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<Onboarding onSubmit={onSubmit} onSignOut={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Administración de consorcios'));
    fillName();
    expect(screen.getByText(/Después de registrarte vas a poder crear tu administración/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Nombre de la/)).not.toBeInTheDocument();
    submit();

    expect(onSubmit).toHaveBeenCalledWith({
      profileType: 'propertyManager',
      name: 'Ana',
      middleName: undefined,
      lastName: 'García',
      home: undefined,
      trades: undefined,
    });
  });

  it('requires at least one trade for a tradesman, and sends the chosen ones', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<Onboarding onSubmit={onSubmit} onSignOut={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Profesional de oficio'));
    fillName();
    submit();
    expect(screen.getByRole('alert')).toHaveTextContent('Elegí al menos un oficio.');
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('Plomero'));
    submit();
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ profileType: 'tradesman', trades: ['plumber'] }));
  });

  it('shows the API error', async () => {
    render(
      <Onboarding
        onSubmit={vi.fn().mockRejectedValue(new Error('lastName should not be empty'))}
        onSignOut={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText('Contratista'));
    fillName();
    submit();

    expect(await screen.findByRole('alert')).toHaveTextContent('lastName should not be empty');
  });
});
