using CrmGruppo5.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using System.ComponentModel.Design;

namespace Crm_Gruppo_5.Dto
{
    public class Mapper
    {

        public CompanyDto MapBaseEntitytoDto(Company entity)
        {
            if (entity == null) return null;

            CompanyDto dto = new CompanyDto
            {
                CompanyId = entity.CompanyId,
                Denomination = entity.Denomination,
                Website = entity.Website,
                VatNumber = entity.VatNumber,
                Size = entity.Size,
                Note = entity.Note,
            };
            return dto;
        }

        // CORRETTO: Il tipo di ritorno ora è CompanySimpleDto (prima era CompanyDto e dava errore)
        public CompanySimpleDto MapEntitytoSingleDto(Company entity)
        {
            CompanySimpleDto simpledto = new CompanySimpleDto
            {
                CompanyId = entity.CompanyId,
                Denomination = entity.Denomination,
                Website = entity.Website,
                VatNumber = entity.VatNumber,
                Size = entity.Size,
                Note = entity.Note,
                Address = entity.Address != null ? MapBaseEntityToDto(entity.Address) : null
            };
            return simpledto;
        }

        public Address MapDtoToEntity(AddressDto dto)
        {
            Address entity = new Address
            {
                Street = dto.Street,
                StreetNumber = dto.StreetNumber,
                City = dto.City,
                Province = dto.Province,
                Region = dto.Region,
                zip = dto.zip,
                Country = dto.Country,
                CompanyId = dto.CompanyId,
                ContactId = dto.ContactId
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
                Country = entity.Country,
                CompanyId = entity.CompanyId,
                ContactId = entity.ContactId
            };
            return dto;
        }

        public Company MapDtoToEntity(CompanySimpleDto dto)
        {
            Company entity = new Company
            {
                // CompanyId = dto.CompanyId,
                Denomination = dto.Denomination,
                Website = dto.Website,
                VatNumber = dto.VatNumber,
                Size = dto.Size,
                Note = dto.Note,
                Address = dto.Address != null ? MapDtoToEntity(dto.Address) : null
            };
            return entity;
        }

        public ContactDto MapBaseEntitytoDto(Contact entity)
        {
            if (entity == null) return null;
            ContactDto dto = new ContactDto
            {
                ContactId = entity.ContactId,
                Name = entity.Name,
                Surname = entity.Surname,
                Title = entity.Title,
                WorkRole = entity.WorkRole,
                Gender = entity.Gender,
                Birthday = entity.Birthday,
                Note = entity.Note,
                DateAdded = entity.DateAdded
            };
            return dto;
        }
    }
}
