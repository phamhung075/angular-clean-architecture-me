export abstract class DomainEvent {
    public readonly eventId: string;
    public readonly occurredOn: Date;
    
    constructor() {
      this.eventId = this.generateUuid();
      this.occurredOn = new Date();
    }
    
    // Simple UUID generator for demo purposes
    private generateUuid(): string {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    
    abstract get eventName(): string;
  }