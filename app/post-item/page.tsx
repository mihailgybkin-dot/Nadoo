'use client';
import AddressPicker from '@/components/AddressPicker';

// ...
<AddressPicker
  onChange={(v) => {
    // сохраним координаты и адрес в состояние формы
    setForm((p) => ({ ...p, address: v.address, lat: v.lat, lng: v.lng }));
  }}
/>
