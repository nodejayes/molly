export enum JoinType {
    ONEONE,
    ONEMANY
}

/**
 * Lookup Definition
 * 
 * @export
 * @class MongoLookup
 */
export class MongoLookup {
    /**
     * Name of the Collection to look in
     * 
     * @type {string}
     * @memberof MongoLookup
     */
    From: string;
    /**
     * Name of the Property in the master Collection
     * 
     * @type {string}
     * @memberof MongoLookup
     */
    LocalField: string;
    /**
     * Name of the Property in the Foreign Collection
     * 
     * @type {string}
     * @memberof MongoLookup
     */
    ForeignField: string;
    /**
     * The Type of the Join
     * 
     * @type {JoinType}
     * @memberof MongoLookup
     */
    Type: JoinType;

    /**
     * Creates an instance of MongoLookup.
     * @param {string} from 
     * @param {string} localField 
     * @param {string} foreignField 
     * @param {JoinType} joinType 
     * @memberof MongoLookup
     */
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

    /**
     * get the MongoDb Aggregate based on the JoinType
     * 
     * @returns {Array<Object>} 
     * @memberof MongoLookup
     */
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