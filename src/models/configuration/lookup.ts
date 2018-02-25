export enum JoinType {
    ONEONE,
    ONEMANY
}

/**
 * 
 * 
 * @export
 * @class MongoLookup
 */
export class MongoLookup {
    From: string;
    LocalField: string;
    ForeignField: string;
    Type: JoinType;

    constructor(from: string, localField: string, foreignField: string, joinType: JoinType) {
        if (from.length < 1) {
            throw new Error(`from can not be empty`);
        }
        if (localField.length < 1) {
            throw new Error(`localField can not be empty`);
        }
        if (foreignField.length < 1) {
            throw new Error(`foreignField can not be empty`);
        }
        this.From = from;
        this.LocalField = localField;
        this.ForeignField = foreignField;
        this.Type = joinType;
    }

    getAggregate(): Array<Object> {
        switch(this.Type) {
            case JoinType.ONEONE:
                return [
                    {
                        '$lookup': {
                            'from': this.From,
                            'localField': this.LocalField,
                            'foreignField': this.ForeignField,
                            'as': this.LocalField,
                        }
                    },
                    {
                        '$unwind': {
                            'path': `$${this.From}`,
                            'preserveNullAndEmptyArrays': true,
                        }
                    }
                ];
            case JoinType.ONEMANY:
                return [
                    {
                        '$lookup': {
                            'from': this.From,
                            'localField': this.LocalField,
                            'foreignField': this.ForeignField,
                            'as': this.LocalField,
                        }
                    }
                ];
            default:
                return [];
        }
    }
}