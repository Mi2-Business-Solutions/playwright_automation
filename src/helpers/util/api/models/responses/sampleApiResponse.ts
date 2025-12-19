export default class SampleApiResponse{
    resultData: any[]

    constructor(init?: Partial<SampleApiResponse>) {
        Object.assign(this, init);
        this.resultData = init?.resultData?.map(sampleResData => sampleResData) || [];
    }
}