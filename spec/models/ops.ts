import {operation}     from '../../src/decorators';
import {IRouteInvoker} from '../../src/interfaces';

export class Ops {
  @operation({})
  async countUser(inv: IRouteInvoker) {
    let user = await inv.read('User', {});
    return user.length;
  }

  @operation({})
  async passParameter(inv: IRouteInvoker, params: any) {
    return params;
  }
}
