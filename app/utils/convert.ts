export const formatDate = (unixTimestamp: number) => {
  const date = new Date(unixTimestamp * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const restrictRange = (n: any, min: number, max: number) =>
  Number(n) > max ? max : Number(n) < min ? min : n
