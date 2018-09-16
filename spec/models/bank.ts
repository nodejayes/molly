import {collection, validation} from '../../src/decorators';
import {JoinType, MongoLookup}  from '../../src/models';
import {BaseTypes}              from '../../src/basic';
import {User1, User2}           from './user';

@collection({
  allow: 'CUD',
  lookup: [
    new MongoLookup('User1', 'user', '_id', JoinType.ONEONE)
  ]
})
export class Bank1 {
  @validation({type: BaseTypes.mongoDbObjectId})
  _id: string;
  @validation({type: BaseTypes.stringDefaultLength})
  name: string;
  user: User1;
}

@collection({
  allow: 'CUD',
  lookup: [
    new MongoLookup('User2', 'users', '_id', JoinType.ONEMANY)
  ]
})
export class Bank2 {
  @validation({type: BaseTypes.mongoDbObjectId})
  _id: string;
  @validation({type: BaseTypes.stringDefaultLength})
  name: string;
  users: User2[];
}
