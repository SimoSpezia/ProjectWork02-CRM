using CrmGruppo5.Data;
using System.ComponentModel.Design;

namespace Crm_Gruppo_5.Dto
{
    public class Mapper
    {

        public CompanyDto MapBaseEntitytoDto(Company entity)
        {
            CompanyDto dto = new CompanyDto
            {
                CompanyId= entity.CompanyId,
                Denomination = entity.Denomination,
                AddressId = entity.AddressId,
                Website = entity.Website,
                VatNumber = entity.VatNumber,
                Size = entity.Size,
                Note = entity.Note,
            };
            return dto;
        }

        public CompanyDto MapEntitytoSingleDto(Company entity)
        {
            CompanySimpleDto simpledto = new CompanySimpleDto
            {
                CompanyId = entity.CompanyId,
                Denomination = entity.Denomination,
                AddressId = entity.AddressId,
                Website = entity.Website,
                VatNumber = entity.VatNumber,
                Size = entity.Size,
                Note = entity.Note,
                Address = MapBaseEntityToDto(entity.Address)
            };
            return simpledto;
        }

        public Address MapDtoToEntity(AddressDto dto)
        {
            Address entity = new Address
            {
                //AddressId = dto.AddressId,
                Street = dto.Street,
                StreetNumber = dto.StreetNumber,
                City = dto.City,
                Province = dto.Province,
                Region = dto.Region,
                zip = dto.zip,
                Country = dto.Country
            };
            return entity;
        }


        public AddressDto MapBaseEntityToDto(Address entity)
        {
            AddressDto dto = new AddressDto
            {
                AddressId = entity.AddressId,
                Street = entity.Street,
                StreetNumber = entity.StreetNumber,
                City = entity.City,
                Province = entity.Province,
                Region = entity.Region,
                zip = entity.zip,
                Country = entity.Country
            };
            return dto;
        }

       public Company MapDtoToEntity(CompanySimpleDto dto)
        {
            Company entity = new Company
            {
                //CompanyId = dto.CompanyId,
                Denomination = dto.Denomination,
                AddressId = dto.AddressId,
                Website = dto.Website,
                VatNumber = dto.VatNumber,
                Size = dto.Size,
                Note = dto.Note,
                Address = MapDtoToEntity(dto.Address)
            };
            return entity;
        }
    }
}
