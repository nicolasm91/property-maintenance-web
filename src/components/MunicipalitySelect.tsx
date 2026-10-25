import { useState } from 'react';
import { useMunicipalities, useProvinces } from '../municipalities.ts';
import type { MunicipalitySummary } from '../user.ts';
import { Field, FieldLabel } from './ui/field.tsx';
import { NativeSelect, NativeSelectOption } from './ui/native-select.tsx';

interface Props {
  id: string;
  value: MunicipalitySummary | null;
  onChange: (municipality: MunicipalitySummary | null) => void;
}

// Province first, then one of its localities.
export default function MunicipalitySelect({ id, value, onChange }: Props) {
  const provinces = useProvinces();
  const [provinceId, setProvinceId] = useState('');
  const municipalities = useMunicipalities(provinceId);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field>
        <FieldLabel htmlFor={`${id}-province`}>Provincia</FieldLabel>
        <NativeSelect
          id={`${id}-province`}
          className="w-full"
          value={provinceId}
          disabled={!provinces}
          onChange={(event) => {
            setProvinceId(event.target.value);
            onChange(null);
          }}
        >
          <NativeSelectOption value="">Elegí una provincia</NativeSelectOption>
          {provinces?.map((province) => (
            <NativeSelectOption key={province.id} value={province.id}>
              {province.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-municipality`}>Localidad</FieldLabel>
        <NativeSelect
          id={`${id}-municipality`}
          className="w-full"
          value={value?.id ?? ''}
          disabled={!municipalities}
          onChange={(event) => {
            const chosen = municipalities?.find((each) => each.id === event.target.value);
            onChange(chosen ? { id: chosen.id, name: chosen.name, provinceName: chosen.provinceName } : null);
          }}
        >
          <NativeSelectOption value="">
            {provinceId ? 'Elegí una localidad' : 'Primero elegí la provincia'}
          </NativeSelectOption>
          {municipalities?.map((municipality) => (
            <NativeSelectOption key={municipality.id} value={municipality.id}>
              {municipality.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
    </div>
  );
}
