import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { useMunicipalities, useProvinces } from '../municipalities.ts';
import { formatMunicipality, type MunicipalitySummary } from '../user.ts';
import { Badge } from './ui/badge.tsx';
import { Checkbox } from './ui/checkbox.tsx';
import { Field, FieldLabel } from './ui/field.tsx';
import { Input } from './ui/input.tsx';
import { NativeSelect, NativeSelectOption } from './ui/native-select.tsx';
import { Skeleton } from './ui/skeleton.tsx';

interface Props {
  value: MunicipalitySummary[];
  onChange: (municipalities: MunicipalitySummary[]) => void;
}

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

// Several localities, from any province: the tradesman's service area.
export default function MunicipalitiesPicker({ value, onChange }: Props) {
  const provinces = useProvinces();
  const [provinceId, setProvinceId] = useState('');
  const [filter, setFilter] = useState('');
  const municipalities = useMunicipalities(provinceId);
  const chosen = new Set(value.map((each) => each.id));

  const toggle = (municipality: MunicipalitySummary) =>
    onChange(
      chosen.has(municipality.id) ? value.filter((each) => each.id !== municipality.id) : [...value, municipality],
    );

  const visible = (municipalities ?? []).filter((each) => normalize(each.name).includes(normalize(filter)));

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Localidades elegidas">
          {value.map((municipality) => (
            <Badge key={municipality.id} variant="secondary" className="gap-1 py-1 pr-1">
              {formatMunicipality(municipality)}
              <button
                type="button"
                aria-label={`Quitar ${municipality.name}`}
                className="rounded-full p-0.5 hover:bg-foreground/10"
                onClick={() => toggle(municipality)}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="zones-province">Provincia</FieldLabel>
          <NativeSelect
            id="zones-province"
            className="w-full"
            value={provinceId}
            disabled={!provinces}
            onChange={(event) => {
              setProvinceId(event.target.value);
              setFilter('');
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
          <FieldLabel htmlFor="zones-filter">Buscar localidad</FieldLabel>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="zones-filter"
              className="pl-8"
              value={filter}
              disabled={!provinceId}
              onChange={(event) => setFilter(event.target.value)}
            />
          </div>
        </Field>
      </div>
      {provinceId && !municipalities && <Skeleton className="h-40" />}
      {municipalities && (
        <div className="max-h-64 overflow-y-auto rounded-lg border p-3" role="group" aria-label="Localidades">
          {visible.length === 0 && <p className="text-sm text-muted-foreground">Ninguna localidad coincide.</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            {visible.map((municipality) => (
              <Field key={municipality.id} orientation="horizontal">
                <Checkbox
                  id={`zone-${municipality.id}`}
                  checked={chosen.has(municipality.id)}
                  onCheckedChange={() =>
                    toggle({ id: municipality.id, name: municipality.name, provinceName: municipality.provinceName })
                  }
                />
                <FieldLabel htmlFor={`zone-${municipality.id}`} className="font-normal">
                  {municipality.name}
                </FieldLabel>
              </Field>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
