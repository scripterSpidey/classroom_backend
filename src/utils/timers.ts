export const otpExpiration = () =>
    new Date(
        Date.now() + 1000 * 1 * 20
    )