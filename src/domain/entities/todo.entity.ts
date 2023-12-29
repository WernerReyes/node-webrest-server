export class TodoEntity {
  constructor(
    public id: number,
    public text: string,
    public completedAt?: Date | null
  ) {}

  get isCompleted():boolean {
    return !!this.completedAt;
  }

  public static fromObject(object: {[key:string]: any}):TodoEntity {
    const { id, text, completedAt } = object;
    if(!id) throw new Error('Id is required');
    if(!text) throw new Error('Text is required');
    
    let newCompletedAt:Date | null = null;

    if(completedAt) {
      newCompletedAt = new Date(completedAt);
      if(isNaN(newCompletedAt.getTime())) {
        throw 'CompletedAt is not a valid date'
      }
    }

    return new TodoEntity(id, text, newCompletedAt);
  }
}
