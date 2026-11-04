// lib/ongkir.ts

interface HitungOngkirParams {
  biayaRute: number;
  muatanTerpesan: number;
  jumlahPesanan: number;
  kuotaMinimum?: number;
  tarifMinimum?: number;
}

export function hitungOngkir({
  biayaRute,
  muatanTerpesan,
  jumlahPesanan,
  kuotaMinimum = 50,
  tarifMinimum = 2000,
}: HitungOngkirParams): number {
  const totalMuatan = muatanTerpesan + jumlahPesanan;
  const penyebut = Math.max(totalMuatan, kuotaMinimum);
  const ongkirPerKg = biayaRute / penyebut;

  return Math.max(tarifMinimum, Math.round(ongkirPerKg));
}