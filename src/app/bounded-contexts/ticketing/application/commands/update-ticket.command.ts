export class UpdateTicketCommand {
    constructor(
      public readonly id: number,
      public readonly name: string
    ) {}
  }