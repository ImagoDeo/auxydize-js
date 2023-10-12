function formatTOTP(name, totp, { validFor = null, index = 0 }) {
  const indexString =
    index < 0 ? `previous ${index}` : index > 0 ? `next +${index}` : 'current';
  const validForString = validFor ? `${validFor}s` : undefined;
  const segments = [name, totp, validForString, indexString];
  return segments.join(' | ');
}

module.exports = { formatTOTP };
