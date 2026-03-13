using CrmGruppo5.Data;
namespace Crm_Gruppo_5.Dto
{
    public class Mapper
    {

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

        // CORRETTO: Il tipo di ritorno ora è CompanySimpleDto (prima era CompanyDto e dava errore)
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
                DateAdded = dto.DateAdded
            };
            return entity;
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
                DateAdded = entity.DateAdded,
                ContactType = entity.ContactType != null ? MapBaseEntitytoDto(entity.ContactType) : null,
                Address = entity.Address != null ? MapBaseEntityToDto(entity.Address) : null,
                Company = entity.Company != null ? MapBaseEntitytoDto(entity.Company) : null,
                MailAddresses = entity.MailAddresses != null ? entity.MailAddresses.Select(m => MapBaseEntitytoDto(m)).ToList() : null,
                PhoneNumbers = entity.PhoneNumbers != null ? entity.PhoneNumbers.Select(p => MapBaseEntitytoDto(p)).ToList() : null,
                Categories = entity.Categories != null ? entity.Categories.Select(c => MapBaseEntitytoDto(c)).ToList() : null
            };
            return detailsDto;
        }

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

        public MailAddressDto MapBaseEntitytoDto(MailAddress entity)
        {
            if (entity == null)
                return null;

            MailAddressDto dto = new MailAddressDto
            {
                MailAddressId = entity.MailAddressId,
                Mail = entity.Mail
            };
            return dto;
        }

        public PhoneNumberDto MapBaseEntitytoDto(PhoneNumber entity)
        {
            if (entity == null)
                return null;

            PhoneNumberDto dto = new PhoneNumberDto
            {
                PhoneNumberId = entity.PhoneNumberId,
                Number = entity.Number,
                Prefix = entity.Prefix,
                Nationality = entity.Nationality
            };
            return dto;
        }

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

    }
}
