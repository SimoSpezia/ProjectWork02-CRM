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
            // Contact - Address (1-to-1)
            modelBuilder.Entity<Contact>()
                .HasOne(c => c.Address)
                .WithOne(a => a.Contact)
                .OnDelete(DeleteBehavior.Cascade);

            // Contact - Company (N-to-1)
            modelBuilder.Entity<Contact>()
                .HasOne(c => c.Company)
                .WithMany(co => co.Contacts)
                .OnDelete(DeleteBehavior.SetNull);

            // Contact - ContactType (N-to-1)
            modelBuilder.Entity<Contact>()
                .HasOne(c => c.ContactType)
                .WithMany(ct => ct.Contacts)
                .OnDelete(DeleteBehavior.Restrict);

            // Contact - MailAddress (1-to-N)
            modelBuilder.Entity<Contact>()
                .HasMany(c => c.MailAddresses)
                .WithOne(m => m.Contact)
                .OnDelete(DeleteBehavior.Cascade);

            // Contact - PhoneNumber (1-to-N)
            modelBuilder.Entity<Contact>()
                .HasMany(c => c.PhoneNumbers)
                .WithOne(p => p.Contact)
                .OnDelete(DeleteBehavior.Cascade);

            // Contact - Category (N-to-N)
            modelBuilder.Entity<Contact>()
                .HasMany(c => c.Categories)
                .WithMany(ca => ca.Contacts)
                .UsingEntity(e => e.ToTable("Group"));

            // MailAddress - MailAddressType (N-to-1)
            modelBuilder.Entity<MailAddress>()
                .HasOne(m => m.MailAddressType)
                .WithMany(mat => mat.Mails)
                .OnDelete(DeleteBehavior.SetNull);

            // PhoneNumber - PhoneNumberType (N-to-1)
            modelBuilder.Entity<PhoneNumber>()
                .HasOne(p => p.PhoneNumberType)
                .WithMany(pnt => pnt.Numbers)
                .OnDelete(DeleteBehavior.SetNull);

            // Company - Address (1-to-1)
            modelBuilder.Entity<Company>()
                .HasOne(co => co.Address)
                .WithOne(a => a.Company)
                .OnDelete(DeleteBehavior.Cascade);
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
