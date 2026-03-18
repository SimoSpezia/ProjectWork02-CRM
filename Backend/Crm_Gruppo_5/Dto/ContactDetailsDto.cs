using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations;
namespace Crm_Gruppo_5.Dto
{
    public class ContactDetailsDto : ContactDto
    {
        public required ContactTypeDto ContactType { get; set; }
        public List<MailAddressDto>? MailAddresses { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public List<CategoryDto>? Categories { get; set; }
        [MaxLength(ValidationLengths.LongText)]
        public string? CategoriesAsString { get; set; }
        public List<PhoneNumberDto>? PhoneNumbers { get; set; }
        public required AddressDto Address { get; set; }
        public CompanyDto? Company { get; set; } = null;
    }
}
