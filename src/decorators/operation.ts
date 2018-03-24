import { IOperationParameter } from 'interfaces';
import { Logic } from 'basic';
import { OperationInformation } from 'models';

/**
 * Decorate a Class Method to be a Operation
 * 
 * @export
 * @param {IOperationParameter} props 
 * @returns 
 */
export function operation(props: IOperationParameter) {
    return function (target, key: string) {
        Logic.Configuration.operationInfos.push(
            new OperationInformation(key, target[key], props.Description, props.Summary)
        );
    };
}