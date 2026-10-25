import { fireEvent, render, screen } from '@testing-library/react';
import { useApi } from '../api.ts';
import { catalogResponse } from '../test-utils.tsx';
import Onboarding from './Onboarding.tsx';

vi.mock('../api.ts', async (importOriginal) => ({ ...(await importOriginal<object>()), useApi: vi.fn() }));

const fillName = () => {
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: ' Ana ' } });
  fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'García' } });
};

const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

describe('Onboarding', () => {
  const api = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useApi).mockReturnValue(api);
    api.mockImplementation((_method: string, path: string) => Promise.resolve(catalogResponse(path)));
  });

  it('sends a direct client with their home and its locality', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<Onboarding onSubmit={onSubmit} onSignOut={vi.fn()} />);

    fillName();
    fireEvent.change(screen.getByLabelText('Calle'), { target: { value: 'Av. Corrientes' } });
    fireEvent.change(screen.getByLabelText('Número'), { target: { value: '1234' } });
    fireEvent.change(screen.getByLabelText('Código postal'), { target: { value: 'C1043' } });
    fireEvent.change(screen.getByLabelText('Entre calles'), { target: { value: 'Talcahuano y Libertad' } });
    submit();
    expect(screen.getByRole('alert')).toHaveTextContent('Elegí la localidad de tu casa.');

    await screen.findByRole('option', { name: 'Buenos Aires' });
    fireEvent.change(screen.getByLabelText('Provincia'), { target: { value: '02' } });
    await screen.findByRole('option', { name: 'Comuna 1' });
    fireEvent.change(screen.getByLabelText('Localidad'), { target: { value: '022007' } });
    submit();

    expect(api).toHaveBeenCalledWith('GET', '/municipalities?provinceId=02');
    expect(onSubmit).toHaveBeenCalledWith({
      profileType: 'directClient',
      name: 'Ana',
      middleName: undefined,
      lastName: 'García',
      home: {
        street: 'Av. Corrientes',
        number: '1234',
        postalCode: 'C1043',
        intersection: 'Talcahuano y Libertad',
        municipalityId: '022007',
      },
      trades: undefined,
      municipalityIds: undefined,
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
      municipalityIds: undefined,
    });
  });

  it('requires a trade and a locality for a tradesman, and sends them', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<Onboarding onSubmit={onSubmit} onSignOut={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Profesional de oficio'));
    fillName();
    submit();
    expect(screen.getByRole('alert')).toHaveTextContent('Elegí al menos un oficio.');

    fireEvent.click(screen.getByLabelText('Plomero'));
    submit();
    expect(screen.getByRole('alert')).toHaveTextContent('Elegí al menos una localidad donde trabajes.');

    await screen.findByRole('option', { name: 'Buenos Aires' });
    fireEvent.change(screen.getByLabelText('Provincia'), { target: { value: '02' } });
    fireEvent.click(await screen.findByLabelText('Comuna 1'));
    fireEvent.click(screen.getByLabelText('Comuna 2'));
    submit();

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ profileType: 'tradesman', trades: ['plumber'], municipalityIds: ['022007', '022014'] }),
    );
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
