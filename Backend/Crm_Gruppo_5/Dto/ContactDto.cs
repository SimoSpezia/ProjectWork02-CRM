using CrmGruppo5.Data;
using System.ComponentModel.DataAnnotations;

namespace Crm_Gruppo_5.Dto
{
    public class ContactDto
    {
        public int ContactId { get; set; }
        public required string Name { get; set; }
        public required string Surname { get; set; }
        public string? Title { get; set; }
        public string? WorkRole { get; set; }
        public string? Gender { get; set; }
        public DateOnly? Birthday { get; set; }
        public string? Note { get; set; }
        public required DateTime DateAdded { get; set; }
    }
}
