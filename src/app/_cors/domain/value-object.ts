export abstract class ValueObject<T> {
    protected readonly props: T;
    
    constructor(props: T) {
      this.props = props;
    }
    
    public equals(valueObject?: ValueObject<T>): boolean {
      if (valueObject === null || valueObject === undefined) {
        return false;
      }
      
      if (valueObject.props === undefined) {
        return false;
      }
      
      return JSON.stringify(this.props) === JSON.stringify(valueObject.props);
    }
    
    public getProps(): T {
      return this.props;
    }
  }