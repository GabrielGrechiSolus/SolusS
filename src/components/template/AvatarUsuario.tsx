import Link from 'next/link';
import useAuth from '../../data/hook/useAuth';

interface AvatarUsuarioProps {
    className?: string;
}

export default function AvatarUsuario(props: AvatarUsuarioProps) {
    const { usuario } = useAuth();
    return (
        <Link href="/perfil" passHref >

                {usuario?.nome ?? 'Perfil'}
        </Link>
    );
}
