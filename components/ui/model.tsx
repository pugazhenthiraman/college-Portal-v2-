// "use client";

// import { Dialog, DialogContent, DialogTitle, DialogClose } from "@radix-ui/react-dialog";
// import { Button } from "../ui/button";

// type ModalProps = {
//   isOpen: boolean;
//   onClose: () => void;
//   title: string;
//   children: React.ReactNode;
// };

// export function Modal({ isOpen, onClose, title, children }: ModalProps) {
//   if (!isOpen) return null;

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="fixed inset-0 flex items-center justify-center bg-black/50">
//         <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
//           <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
//           <div className="mt-2">{children}</div>
//           <div className="mt-4 border-t pt-4 flex justify-center">
//             <DialogClose asChild>
//               <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600">
//                 Close
//               </Button>
//             </DialogClose>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
