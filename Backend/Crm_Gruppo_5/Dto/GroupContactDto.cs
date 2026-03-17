namespace Crm_Gruppo_5.Dto
{
    public class GroupContactDto
    {
        public int ContactId { get; set; }
        public List<CategoryDto> Categories { get; set; } = new();
    }
}
