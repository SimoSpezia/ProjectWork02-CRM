
namespace Crm_Gruppo_5.Dto
{
    public class ContactDetailsDto : ContactDto
    {
        public required ContactTypeDto ContactType { get; set; }
        public List<MailAddressDto>? MailAddresses { get; set; }
        public List<CategoryDto>? Categories { get; set; }
        public List<PhoneNumberDto>? PhoneNumbers { get; set; }
        public required AddressDto Address { get; set; }
        public CompanyDto? Company { get; set; } = null;
    }
}
