export type curveKind = 'ct' | 'bri';

export class CreateCurveDto {
    name: string;
    kind: curveKind;
    count = 2;
}
