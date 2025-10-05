export function SectionHeader({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="space-y-2 pb-2">
            <h1 className="text-2xl font-semibold leading-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}
