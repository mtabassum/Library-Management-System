namespace LibraryManagementSystem.Domain
{
    public class Member
    {
        public int Id { get; private set; }
        public string MemberCode { get; private set; } = null!;
        public string Name { get; private set; } = null!;
        public string Phone { get; private set; } = null!;
        public string Address { get; private set; } = null!;
        public MemberStatus Status { get; private set; }

        public bool IsActive => Status == MemberStatus.Active;

        private Member() { }

        public Member(string memberCode, string name, string phone, string address)
        {
            MemberCode = memberCode;
            Name = name;
            Phone = phone;
            Address = address;
            Status = MemberStatus.Active;
        }
        public void Deactivate() => Status = MemberStatus.Inactive;

        public void Reactivate() => Status = MemberStatus.Active;
    }
}
