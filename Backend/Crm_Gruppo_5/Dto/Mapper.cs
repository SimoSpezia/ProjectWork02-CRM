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
    }
}
