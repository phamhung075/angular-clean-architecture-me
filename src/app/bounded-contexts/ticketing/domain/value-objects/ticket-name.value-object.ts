import { ValueObject } from "../../../../_cors/domain/value-object";

interface TicketNameProps {
  value: string;
}

export class TicketName extends ValueObject<TicketNameProps> {
  private constructor(props: TicketNameProps) {
    super(props);
  }
  
  public static create(name: string): TicketName {
    if (!name || name.trim().length === 0) {
      throw new Error('Ticket name cannot be empty');
    }
    
    if (name.length > 50) {
      throw new Error('Ticket name cannot be longer than 50 characters');
    }
    
    return new TicketName({ value: name.trim() });
  }
  
  get value(): string {
    return this.props.value;
  }
}