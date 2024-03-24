import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';

const Checkbox = () => {
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <RadixCheckbox.Root className="CheckboxRoot" defaultChecked id="c1">
                <RadixCheckbox.Indicator className="CheckboxIndicator">
                <CheckIcon />
                </RadixCheckbox.Indicator>
            </RadixCheckbox.Root>
            <label className="Label pl-3" htmlFor="c1">
                Accept terms and conditions.
            </label>
        </div>
    )
}

export default Checkbox;