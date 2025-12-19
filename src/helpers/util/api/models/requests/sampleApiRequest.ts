export default class SampleApiRequest
    {
        CompanyCode: string = "00555";
        CropYear: number = 2024;
        AccountNumber: number;
        IsAvailabilityChecked: boolean | false;
        IsRelatedtoDealerItemsOnly: boolean | false;
        Brand: string | null;
        MarketingBrandList: string[] = [];
        SeedSizeList: any[] = [];
        PackageSizeList: any[] = [];
        TechnologyList: any[] = null;
        TreatmentList: [] = [];
        ProductLineList: string[] = [];
        MaturityMin: null;
        MaturityMax: null;
        ItemNoList: [];
        ScreenName: "grower";
    }
