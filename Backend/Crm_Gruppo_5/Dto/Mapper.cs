using CrmGruppo5.Data;
namespace Crm_Gruppo_5.Dto
{
    public class Mapper
    {

        // Mapper da Company Entity a CompanyDto.
        public CompanyDto MapBaseEntitytoDto(Company entity)
        {
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

        // Mapper da Company Entity a CompanySimpleDto.
        public CompanySimpleDto MapEntitytoSimpleDto(Company entity)
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

        // Mapper da Contact Entity a ContactSimpleDto.
        public ContactSimpleDto MapEntitytoSimpleDto(Contact entity)
        {
            ContactSimpleDto simpledto = new ContactSimpleDto
            {
                ContactId = entity.ContactId,
                Name = entity.Name,
                Surname = entity.Surname,
                Title = entity.Title,
                WorkRole = entity.WorkRole,
                Gender = entity.Gender,
                Birthday = entity.Birthday,
                Note = entity.Note,
                CompanyDenomination = entity.Company != null ? entity.Company.Denomination : null,
                TypeDenomination = entity.ContactType != null ? entity.ContactType.Description : null,
                Address = entity.Address != null ? MapBaseEntityToDto(entity.Address) : null
            };
            return simpledto;
        }

        // Mapper da ContactDto a Contact Entity.
        public Contact MapDtoToEntity(ContactDto dto)
        {
            Contact entity = new Contact
            {
                Name = dto.Name,
                Surname = dto.Surname,
                Title = dto.Title,
                WorkRole = dto.WorkRole,
                Gender = dto.Gender,
                Birthday = dto.Birthday,
                Note = dto.Note,
            };
            return entity;
        }

        // Mapper da PhoneNumberDto a PhoneNumber Entity.
        public PhoneNumber MapDtoToEntity(PhoneNumberDto dto)
        {
            PhoneNumber entity = new PhoneNumber
            {
                Number = dto.Number,
                Prefix = dto.Prefix,
                Nationality = dto.Nationality
            };
            return entity;
        }

        // Mapper da MailAddressDto a MailAddress Entity.
        public MailAddress MapDtoToEntity(MailAddressDto dto)
        {
            MailAddress entity = new MailAddress
            {
                Mail = dto.Mail
            };
            return entity;
        }

        // Mapper da MailAddressTypeDto a MailAddressType Entity.
        public MailAddressType MapDtoToEntity(MailAddressTypeDto dto)
        {
            MailAddressType entity = new MailAddressType
            {
                Description = dto.Description,
                Priority = dto.Priority
            };
            return entity;
        }

        // Mapper da AddressDto a Address Entity.
        public Address MapDtoToEntity(AddressDto dto)
        {
            Address entity = new Address
            {
                Street = dto.Street,
                StreetNumber = dto.StreetNumber,
                City = dto.City,
                Province = dto.Province,
                Region = dto.Region,
                Zip = dto.Zip,
                Country = dto.Country,
                CompanyId = dto.CompanyId,
                ContactId = dto.ContactId
            };
            return entity;
        }

        // Mapper da Address Entity a AddressDto.
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
                Zip = entity.Zip,
                Country = entity.Country,
                CompanyId = entity.CompanyId,
                ContactId = entity.ContactId
            };
            return dto;
        }

        // Mapper da CompanySimpleDto a Company Entity.
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

        // Mapper da Contact Entity a ContactDto.
        public ContactDto MapBaseEntitytoDto(Contact entity)
        {
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
                CompanyDenomination = entity.Company != null ? entity.Company.Denomination : null,
                TypeDenomination = entity.ContactType != null ? entity.ContactType.Description : null
            };
            return dto;
        }

        // Mapper da Contact Entity a ContactDetailsDto.
        public ContactDetailsDto MapEntityToContactDetailsDto(Contact entity)
        {
            ContactDetailsDto detailsDto = new ContactDetailsDto
            {
                ContactId = entity.ContactId,
                Name = entity.Name,
                Surname = entity.Surname,
                Title = entity.Title,
                WorkRole = entity.WorkRole,
                Gender = entity.Gender,
                Birthday = entity.Birthday,
                Note = entity.Note,
                ContactType = entity.ContactType != null ? MapBaseEntitytoDto(entity.ContactType) : null,
                Address = entity.Address != null ? MapBaseEntityToDto(entity.Address) : null,
                Company = entity.Company != null ? MapBaseEntitytoDto(entity.Company) : null,
                MailAddresses = entity.MailAddresses != null ? entity.MailAddresses.Select(m => MapBaseEntitytoDto(m)).ToList() : null,
                PhoneNumbers = entity.PhoneNumbers != null ? entity.PhoneNumbers.Select(p => MapBaseEntitytoDto(p)).ToList() : null,
                Categories = entity.Categories != null ? entity.Categories.Select(c => MapBaseEntitytoDto(c)).ToList() : null
            };
            return detailsDto;
        }

        // Mapper da ContactType Entity a ContactTypeDto.
        public ContactTypeDto MapBaseEntitytoDto(ContactType entity)
        {
            if (entity == null)
                return null;

            ContactTypeDto dto = new ContactTypeDto
            {
                ContactTypeId = entity.ContactTypeId,
                Description = entity.Description
            };
            return dto;
        }

        // Mapper da MailAddress Entity a MailAddressDto.
        public MailAddressDto MapBaseEntitytoDto(MailAddress entity)
        {
            if (entity == null)
                return null;

            MailAddressDto dto = new MailAddressDto
            {
                MailAddressId = entity.MailAddressId,
                Mail = entity.Mail,
                MailAddressTypeId = entity.MailAddressType?.MailAddressTypeId
            };
            return dto;
        }

        // Mapper da MailAddress Entity a MailAddressDetailsDto.
        public MailAddressDetailsDto MapEntityToMailAddressDetailsDto(MailAddress entity)
        {
            if (entity == null)
                return null;

            MailAddressDetailsDto dto = new MailAddressDetailsDto
            {
                MailAddressId = entity.MailAddressId,
                Mail = entity.Mail,
                Contact = entity.Contact != null ? MapBaseEntitytoDto(entity.Contact) : null,
                MailAddressType = entity.MailAddressType != null ? MapBaseEntitytoDto(entity.MailAddressType) : null
            };
            return dto;
        }

        // Mapper da PhoneNumber Entity a PhoneNumberDto.
        public PhoneNumberDto MapBaseEntitytoDto(PhoneNumber entity)
        {
            if (entity == null)
                return null;

            PhoneNumberDto dto = new PhoneNumberDto
            {
                PhoneNumberId = entity.PhoneNumberId,
                Number = entity.Number,
                Prefix = entity.Prefix,
                Nationality = entity.Nationality,
                PhoneNumberTypeId = entity.PhoneNumberType?.PhoneNumberTypeId
            };
            return dto;
        }

        // Mapper da PhoneNumberTypeDto a PhoneNumberType Entity.
        public PhoneNumberType MapDtoToEntity(PhoneNumberTypeDto dto)
        {
            PhoneNumberType entity = new PhoneNumberType
            {
                Description = dto.Description,
                Priority = dto.Priority
            };
            return entity;
        }

        // Mapper da PhoneNumberType Entity a PhoneNumberTypeDto.
        public PhoneNumberTypeDto MapBaseEntitytoDto(PhoneNumberType entity)
        {
            if (entity == null)
                return null;

            PhoneNumberTypeDto dto = new PhoneNumberTypeDto
            {
                PhoneNumberTypeId = entity.PhoneNumberTypeId,
                Description = entity.Description,
                Priority = entity.Priority
            };
            return dto;
        }

        // Mapper da PhoneNumber Entity a PhoneNumberDetailsDto.
        public PhoneNumberDetailsDto MapEntityToPhoneNumberDetailsDto(PhoneNumber entity)
        {
            if (entity == null)
                return null;

            PhoneNumberDetailsDto dto = new PhoneNumberDetailsDto
            {
                PhoneNumberId = entity.PhoneNumberId,
                Number = entity.Number,
                Prefix = entity.Prefix,
                Nationality = entity.Nationality,
                Contact = entity.Contact != null ? MapBaseEntitytoDto(entity.Contact) : null,
                PhoneNumberType = entity.PhoneNumberType != null ? MapBaseEntitytoDto(entity.PhoneNumberType) : null
            };
            return dto;
        }

        // Mapper da Category Entity a CategoryDto.
        public CategoryDto MapBaseEntitytoDto(Category entity)
        {
            if (entity == null)
                return null;

            CategoryDto dto = new CategoryDto
            {
                CategoryId = entity.CategoryId,
                Description = entity.Description
            };
            return dto;
        }

        // Mapper da MailAddressType Entity a MailAddressTypeDto.
        public MailAddressTypeDto MapBaseEntitytoDto(MailAddressType entity)
        {
            if (entity == null)
                return null;

            MailAddressTypeDto dto = new MailAddressTypeDto
            {
                MailAddressTypeId = entity.MailAddressTypeId,
                Description = entity.Description,
                Priority = entity.Priority
            };
            return dto;
        }

        // Mapper da ContactTypeDto a ContactType Entity.
        public ContactType MapDtoToEntity(ContactTypeDto dto)
        {
            ContactType entity = new ContactType
            {
                Description = dto.Description
            };
            return entity;
        }

        // Mapper da CategoryDto a Category Entity.
        public Category MapDtoToEntity(CategoryDto dto)
        {
            Category entity = new Category
            {
                Description = dto.Description
            };
            return entity;
        }
    }
}
