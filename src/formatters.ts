export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''
  if (digits.length <= 2) return `(${digits}`
  const ddd = digits.slice(0, 2)
  const number = digits.slice(2)
  if (number.length <= 4) return `(${ddd}) ${number}`
  if (number.length <= 8) return `(${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`
  return `(${ddd}) ${number.slice(0, 5)}-${number.slice(5, 9)}`
}

export function formatCurrency(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 12)
  if (!digits) return ''
  const amount = Number(digits) / 100
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
