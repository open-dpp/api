export const semitrailerAas = {
  assetAdministrationShells: [
    {
      modelType: 'AssetAdministrationShell',
      assetInformation: {
        assetKind: 'Instance',
        assetType: 'product',
        globalAssetId: 'Semitrailer_Truck_LA-80213092-01',
      },
      submodels: [
        {
          keys: [
            {
              type: 'Submodel',
              value: 'Semitrailer_Truck_LA-80213092-01_Nameplate',
            },
          ],
          referredSemanticId: {
            keys: [
              {
                type: 'GlobalReference',
                value: 'No_Reference',
              },
            ],
          },
          type: 'ExternalReference',
        },
        {
          keys: [
            {
              type: 'Submodel',
              value: 'Semitrailer_Truck_LA-80213092-01_CarbonFootprint',
            },
          ],
          referredSemanticId: {
            keys: [
              {
                type: 'GlobalReference',
                value: 'No_Reference',
              },
            ],
            type: 'ExternalReference',
          },
          type: 'ExternalReference',
        },
      ],
      extensions: [
        {
          name: 'namespace',
          value: 'Product',
          valueType: 'xs:string',
        },
        {
          name: 'isRootOfProductTree',
          value: 'true',
        },
      ],
      id: 'Semitrailer_Truck_LA-80213092-01',
      displayName: [
        {
          language: 'EN',
          text: 'de.proalpha.product.semitrailer_truck',
        },
      ],
      idShort: 'Semitrailer_Truck',
    },
  ],
  submodels: [
    {
      modelType: 'Submodel',
      kind: 'Instance',
      semanticID: {
        keys: [
          {
            type: 'GlobalReference',
            value: 'https://admin-shell.io/idta/nameplate/3/0/Nameplate',
          },
        ],
        type: 'ExternalReference',
      },
      administration: {
        revision: '0',
        templateID: 'https://admin-shell.io/IDTA',
        version: '3',
      },
      id: 'Semitrailer_Truck_LA-80213092-01_Nameplate',
      description: [
        {
          language: 'EN',
          text: 'Information about the digital nameplate of the product',
        },
      ],
      idShort: 'Nameplate',
      submodelElements: [
        {
          modelType: 'Property',
          value: '0112/2///61987#TR590#700',
          idShort: 'URIOfTheProduct',
        },
        {
          modelType: 'Property',
          value: 'Proalpha GmbH',
          idShort: 'ManufacturerName',
        },
        {
          modelType: 'Property',
          value: 'Semitrailer_Truck',
          idShort: 'ManufacturerProductDesignation',
        },
        {
          modelType: 'SubmodelElementCollection',
          idShort: 'AddressInformation',
          value: [
            {
              modelType: 'Property',
              value: 'Product Developer',
              idShort: 'RoleOfContactPerson',
            },
            {
              modelType: 'Property',
              value: 'Dr.',
              idShort: 'Title',
            },
            {
              modelType: 'Property',
              value: 'DE',
              idShort: 'NationalCode',
            },
            {
              modelType: 'Property',
              value: 'DE',
              idShort: 'Language',
            },
            {
              modelType: 'Property',
              value: 'GMT+2',
              idShort: 'TimeZone',
            },
            {
              modelType: 'Property',
              value: 'Weilerbach',
              idShort: 'CityTown',
            },
            {
              modelType: 'Property',
              value: 'Proalpha GmbH',
              idShort: 'Company',
            },
            {
              modelType: 'Property',
              value: 'R&D',
              idShort: 'Department',
            },
            {
              modelType: 'Property',
              value: 'Auf dem Immel 8',
              idShort: 'Street',
            },
            {
              modelType: 'Property',
              value: '67685',
              idShort: 'Zipcode',
            },
            {
              modelType: 'Property',
              value: '1',
              idShort: 'POBox',
            },
            {
              modelType: 'Property',
              value: '67685',
              idShort: 'ZipCodeOfPOBox',
            },
            {
              modelType: 'Property',
              value: 'Rheinland-Pfalz',
              idShort: 'StateCounty',
            },
            {
              modelType: 'Property',
              value: '',
              idShort: 'NameOfContact',
            },
            {
              modelType: 'Property',
              value: '',
              idShort: 'FirstName',
            },
            {
              modelType: 'Property',
              value: 'Vehicle',
              idShort: 'ManufacturerProductRoot',
            },
            {
              modelType: 'Property',
              value: 'Commercial Vehicle',
              idShort: 'ManufacturerProductFamily',
            },
            {
              modelType: 'Property',
              value: 'Truck',
              idShort: 'ManufacturerProductType',
            },
            {
              modelType: 'Property',
              value: '2025',
              idShort: 'YearOfConstruction',
            },
            {
              modelType: 'Property',
              value: '2025-06-10',
              idShort: 'DateOfManufacture',
            },
            {
              modelType: 'Property',
              value: 'HW2025-G123',
              idShort: 'HardwareVersion',
            },
            {
              modelType: 'Property',
              value: 'SW2025-G123',
              idShort: 'SoftwareVersion',
            },
            {
              modelType: 'Property',
              value: 'DE',
              idShort: 'CountryOfOrigin',
            },
            {
              modelType: 'Property',
              value: '',
              idShort: 'CompanyLogo',
            },
          ],
        },
      ],
    },
    {
      modelType: 'Submodel',
      kind: 'Instance',
      semanticID: {
        keys: [
          {
            type: 'GlobalReference',
            value:
              'https://admin-shell.io/idta/CarbonFootprint/CarbonFootprint/0/9',
          },
        ],
        type: 'ModelReference',
      },
      administration: {
        revision: '9',
        templateID:
          'https://admin-shell.io/idta/CarbonFootprint/CarbonFootprint/0/9',
        version: '0',
      },
      id: 'Semitrailer_Truck_LA-80213092-01_CarbonFootprint',
      description: [
        {
          language: 'EN',
          text: 'Information about the carbon footprint of the product',
        },
      ],
      idShort: 'CarbonFootprint',
      submodelElements: [
        {
          modelType: 'SubmodelElementCollection',
          idShort: 'ProductCarbonFootprint_A1A3',
          value: [
            {
              modelType: 'Property',
              value: 'GHG',
              idShort: 'PCFCalculationMethod',
            },
            {
              modelType: 'Property',
              value: '2.6300',
              idShort: 'PCFCO2eq',
            },
            {
              modelType: 'Property',
              value: 'Piece',
              idShort: 'PCFReferenceValueForCalculation',
            },
            {
              modelType: 'Property',
              value: '1',
              idShort: 'PCFQuantityOfMeasureForCalculation',
            },
            {
              modelType: 'Property',
              value: 'A1-A3',
              idShort: 'PCFLifeCyclePhase',
            },
            {
              modelType: 'Property',
              value: '2025-06-11',
              idShort: 'PublicationDate',
            },
            {
              modelType: 'SubmodelElementCollection',
              idShort: 'PCFGoodsAddressHandover',
              value: [
                {
                  modelType: 'Property',
                  value: 'Auf dem Immel',
                  idShort: 'Street',
                },
                {
                  modelType: 'Property',
                  value: '8',
                  idShort: 'HouseNumber',
                },
                {
                  modelType: 'Property',
                  value: '67685',
                  idShort: 'ZipCode',
                },
                {
                  modelType: 'Property',
                  value: 'Weilerbach',
                  idShort: 'CityTown',
                },
                {
                  modelType: 'Property',
                  value: 'Germany',
                  idShort: 'Country',
                },
                {
                  modelType: 'Property',
                  value: '49.478269',
                  idShort: 'Latitude',
                },
                {
                  modelType: 'Property',
                  value: '7.608461',
                  idShort: 'Latitude',
                },
              ],
            },
            {
              modelType: 'Property',
              value: '',
              idShort: 'PCFFactSheet',
            },
          ],
        },
      ],
    },
  ],
};
