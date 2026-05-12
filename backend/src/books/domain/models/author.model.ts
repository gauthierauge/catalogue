export class Author {
    constructor(
        public readonly id: number,
        public readonly firstname: string,
        public readonly lastname: string,
    ) { }

    get fullName(): string {
        return `${this.firstname} ${this.lastname}`;
    }
}
