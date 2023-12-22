
export class DateUtils {

    static daysBetweenDates = (start: Date, end: Date): number => {
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    }

    static daysUntilDateFromNow = (end: Date): number => {
        return Math.ceil((end.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    }

    static relativeTransformation = (daysLeft: number, configuracoes: { daysLeft: number, transformTo: string }[], tratamentoPadrao?: (daysLeft: number) => string): string => {
        const config = configuracoes.filter(c => c.daysLeft === daysLeft);
        if (config && config.length > 0) return config[0].transformTo;
        return tratamentoPadrao ? tratamentoPadrao(daysLeft) : daysLeft.toString();
    }

}