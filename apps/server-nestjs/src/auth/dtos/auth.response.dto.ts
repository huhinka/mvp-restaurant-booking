export class AuthResponseDto {
  constructor(
    public readonly userId: string,
    public readonly role: string,
    public readonly token: string,
  ) {}
}
