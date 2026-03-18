using CrmGruppo5.Data;
using Microsoft.EntityFrameworkCore;

namespace Crm_Gruppo_5.Data
{
    public class ContactDbContext : DbContext
    {
        public ContactDbContext() : base() { }
        public ContactDbContext(DbContextOptions<ContactDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Contact>()
                .HasQueryFilter(c => !c.IsDeleted);

            // Contact - Company (N-a-1) [RESTRICT]
            modelBuilder.Entity<Contact>()
                .HasOne(c => c.Company)
                .WithMany(c => c.Contacts)
                .OnDelete(DeleteBehavior.SetNull);

            // Company - Address (1-a-1) [CASCADE]
            modelBuilder.Entity<Company>()
                .HasOne(c => c.Address)
                .WithOne(a => a.Company)
                .HasForeignKey<Address>(a => a.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);

            // Contact - Address (1-a-1) [CASCADE]
            modelBuilder.Entity<Contact>()
                .HasOne(c => c.Address)
                .WithOne(a => a.Contact)
                .HasForeignKey<Address>(a => a.ContactId)
                .OnDelete(DeleteBehavior.Cascade);

            // Contact - MailAddress (1-a-N) [CASCADE]
            modelBuilder.Entity<Contact>()
                .HasMany(c => c.MailAddresses)
                .WithOne(m => m.Contact)
                .OnDelete(DeleteBehavior.Cascade);

            // Contact - PhoneNumber (1-a-N) [CASCADE]
            modelBuilder.Entity<Contact>()
                .HasMany(c => c.PhoneNumbers)
                .WithOne(p => p.Contact)
                .OnDelete(DeleteBehavior.Cascade);

            // Contact - Category (N-a-N) 
            modelBuilder.Entity<Contact>()
                .HasMany(c => c.Categories)
                .WithMany(ca => ca.Contacts)
                .UsingEntity(e => e.ToTable("Groups"));

            // Contact - ContactType (N-a-1) [RESTRICT]
            modelBuilder.Entity<Contact>()
                .HasOne(c => c.ContactType)
                .WithMany(ct => ct.Contacts)
                .OnDelete(DeleteBehavior.Restrict);

            // MailAddress - MailAddressType (N-a-1) [RESTRICT]
            modelBuilder.Entity<MailAddress>()
                .HasOne(m => m.MailAddressType)
                .WithMany(mat => mat.Mails)
                .OnDelete(DeleteBehavior.Restrict);

            // PhoneNumber - PhoneNumberType (N-a-1) [RESTRICT]
            modelBuilder.Entity<PhoneNumber>()
                .HasOne(p => p.PhoneNumberType)
                .WithMany(pnt => pnt.Numbers)
                .OnDelete(DeleteBehavior.Restrict);
        }



        public DbSet<Address> Addresses { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<ContactType> ContactTypes { get; set; }
        public DbSet<MailAddress> MailAddresses { get; set; }
        public DbSet<MailAddressType> MailAddressTypes { get; set; }
        public DbSet<PhoneNumber> PhoneNumbers { get; set; }
        public DbSet<PhoneNumberType> PhoneNumberTypes { get; set; }


    }
}
