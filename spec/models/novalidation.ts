import {collection} from '../../src/decorators';

@collection({
  allow: 'CUD',
})
export class NoValidation {
  title: string
}
