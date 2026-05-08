interface Member {
  id: string;
  name: string;
  avatar_color: string;
}

export function MemberAvatars({ members }: { members: Member[] }) {
  const visible = members.slice(0, 4);
  return (
    <div className="flex items-center">
      {visible.map((m, i) => (
        <div
          key={m.id}
          className="w-8 h-8 rounded-pill border-2 border-app-bg flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0"
          style={{
            backgroundColor: m.avatar_color,
            marginLeft: i === 0 ? 0 : "-6px",
            zIndex: visible.length - i,
            position: "relative",
          }}
        >
          {m.name[0].toUpperCase()}
        </div>
      ))}
    </div>
  );
}
