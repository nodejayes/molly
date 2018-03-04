export interface IRouteInvoker {
    create(model: string, params: any): Promise<Array<object>>;
    read(model: string, params: any, props?: any): Promise<Array<object>>;
    update(model: string, params: any): Promise<boolean>;
    delete(model: string, params: any): Promise<boolean>;
}