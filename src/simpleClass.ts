export default class SimpleClass {
    public doSomething(value: number): number {
        let newValue = value * 10;
        switch (value) {
            case 1:
                newValue += 5;
                break;
            case 2:
                newValue += 10;
                break;
            case 3:
                newValue += 15;
                break;
            default:
                return -1;
        }
        return newValue;
    }
}