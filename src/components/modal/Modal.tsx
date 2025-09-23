import { X } from '@phosphor-icons/react';
import { ReactNode } from 'react';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm ">
			<div className="bg-white p-5 rounded-lg shadow-lg relative">
				<button onClick={onClose} className="absolute top-2 right-2 text-xl text-[#FD6101]">
					<X size={30} />
				</button>
				{children}
			</div>
		</div>
	);
};

export default Modal;
