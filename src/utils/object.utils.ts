export class ObjectUtils {

    static objectName(object: any): string {
        return Object.keys({object})[0];
    }

    static notNull(object: any): boolean {
        return object !== null && object !== undefined;
    }

}