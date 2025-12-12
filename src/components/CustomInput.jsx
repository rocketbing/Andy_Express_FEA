import {Form, Input, Select, Radio} from 'antd';
export default function CustomInput({ inputAttrs, onChange }) {
    let inputComponent;

    // 如果提供了 onChange，使用非受控模式（用于没有 Form 实例的场景）
    // 否则让 Form 自动管理（受控模式）
    switch (inputAttrs.type) {
      case 'input':
        inputComponent = onChange 
            ? <Input onChange={e => onChange(e.target.value)} placeholder={inputAttrs.placeholder} />
            : <Input placeholder={inputAttrs.placeholder} />;
        break;
      case 'password':
        inputComponent = onChange
            ? <Input.Password onChange={e => onChange(e.target.value)} placeholder={inputAttrs.placeholder}/>
            : <Input.Password placeholder={inputAttrs.placeholder}/>;
        break;
      case 'select':
        inputComponent = onChange
            ? <Select onChange={e => onChange(e)} placeholder={inputAttrs.placeholder} options={inputAttrs.options} />
            : <Select placeholder={inputAttrs.placeholder} options={inputAttrs.options} />;
        break;
      case 'radio':
        inputComponent = onChange
            ? <Radio.Group onChange={e => onChange(e.target.value)} options={inputAttrs.options} />
            : <Radio.Group options={inputAttrs.options} />;
        break;
      default:
        inputComponent = null;
        break;
    }
    return (
        <Form.Item label={inputAttrs.label} name={inputAttrs.name} rules={inputAttrs.rules}>
            {inputComponent}
        </Form.Item>
    )
}