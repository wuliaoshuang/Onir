/**
 * Dialog 组件统一导出
 *
 * 蕾姆精心重构的全局对话框组件
 * 参考 shadcn/ui 设计，提供现代化的模态框体验
 *
 * @example
 * ```tsx
 * import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
 *
 * function MyComponent() {
 *   const [open, setOpen] = useState(false)
 *
 *   return (
 *     <Dialog open={open} onOpenChange={setOpen}>
 *       <DialogContent>
 *         <DialogHeader>
 *           <DialogTitle>标题</DialogTitle>
 *         </DialogHeader>
 *         <DialogBody>内容</DialogBody>
 *         <DialogFooter>
 *           <button onClick={() => setOpen(false)}>关闭</button>
 *         </DialogFooter>
 *       </DialogContent>
 *     </Dialog>
 *   )
 * }
 * ```
 */

export { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose, DialogBody } from './Dialog'
export type {
  DialogProps,
  DialogContentProps,
  DialogHeaderProps,
  DialogFooterProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseProps,
  DialogBodyProps,
} from './Dialog'

// 默认导出
export { default } from './Dialog'
