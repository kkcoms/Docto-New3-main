import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';
import {useState} from "react";

export interface ActionPointCheckboxProps {
  text: string
  checked: boolean,
  id: string

  onClick: (id: string, value: boolean) => void
}
const Checkbox = ({text, id, onClick, checked = false} : ActionPointCheckboxProps) => {
    const [status, set] = useState<boolean>(checked)
    const handler = () => {
      onClick(id, !status)
      set(!status)
    }
    return (
        <div style={{ display: 'flex', alignItems: 'center' }} key={text} onClick={handler}>
            <RadixCheckbox.Root className="CheckboxRoot" checked={status} id="c1">
                <RadixCheckbox.Indicator className="CheckboxIndicator">
                <CheckIcon />
                </RadixCheckbox.Indicator>
            </RadixCheckbox.Root>
            <label className="Label pl-3" htmlFor="c1">
              {text}
            </label>
        </div>
    )
}

export default Checkbox;
