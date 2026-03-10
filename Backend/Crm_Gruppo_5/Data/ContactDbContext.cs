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
            // Contact - Address (1-a-1)
            modelBuilder.Entity<Contact>()
                .HasOne(c => c.Address)
                .WithOne(a => a.Contact)
                .HasForeignKey<Contact>(c => c.AddressId)
                .OnDelete(DeleteBehavior.Restrict);

            // Contact - Company (N-a-1)
            modelBuilder.Entity<Contact>()
                .HasOne(c => c.Company)
                .WithMany(c => c.Contacts)
                .OnDelete(DeleteBehavior.Restrict);

            // Contact - ContactType (N-a-1)
            modelBuilder.Entity<Contact>()
                .HasOne(c => c.ContactType)
                .WithMany(ct => ct.Contacts)
                .OnDelete(DeleteBehavior.Restrict);

            // Contact - MailAddress (1-a-N)
            modelBuilder.Entity<Contact>()
                .HasMany(c => c.MailAddresses)
                .WithOne(m => m.Contact)
                .OnDelete(DeleteBehavior.Restrict);

            // Contact - PhoneNumber (1-a-N)
            modelBuilder.Entity<Contact>()
                .HasMany(c => c.PhoneNumbers)
                .WithOne(p => p.Contact)
                .OnDelete(DeleteBehavior.Restrict);

            // Contact - Category (N-a-N)
            modelBuilder.Entity<Contact>()
                .HasMany(c => c.Categories)
                .WithMany(ca => ca.Contacts)
                .UsingEntity(e => e.ToTable("Groups"));

            // MailAddress - MailAddressType (N-a-1)
            modelBuilder.Entity<MailAddress>()
                .HasOne(m => m.MailAddressType)
                .WithMany(mat => mat.Mails)
                .OnDelete(DeleteBehavior.Restrict);

            // PhoneNumber - PhoneNumberType (N-a-1)
            modelBuilder.Entity<PhoneNumber>()
                .HasOne(p => p.PhoneNumberType)
                .WithMany(pnt => pnt.Numbers)
                .OnDelete(DeleteBehavior.Restrict);

            // Company - Address (1-a-1)
            modelBuilder.Entity<Company>()
                .HasOne(c => c.Address)
                .WithOne(a => a.Company)
                .HasForeignKey<Company>(c => c.AddressId)
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
