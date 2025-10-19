export type User = {
    id: string
    email: string
    isActive: boolean
    isSuperuser: boolean
    isVerified: boolean
};

export type UserCreateInput = {
    id: string
    email: string
    isActive: boolean
    isSuperuser: boolean
    isVerified: boolean
};
