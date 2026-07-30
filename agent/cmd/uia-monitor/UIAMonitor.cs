using System;
using System.Windows.Automation;

namespace UIAMonitor
{
    class Program
    {
        static void Main(string[] args)
        {
            try
            {
                Console.WriteLine("{\"type\": \"MonitorStarted\", \"status\": \"Ready\"}");

                AutomationFocusChangedEventHandler focusHandler = new AutomationFocusChangedEventHandler(OnFocusChanged);
                Automation.AddAutomationFocusChangedEventHandler(focusHandler);

                while (true)
                {
                    System.Threading.Thread.Sleep(100);
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine("Fatal Error: " + ex.Message);
            }
        }

        private static string EscapeJson(string str)
        {
            if (string.IsNullOrEmpty(str)) return "";
            return str.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", "\\n").Replace("\r", "\\r");
        }

        private static void OnFocusChanged(object sender, AutomationEventArgs e)
        {
            try
            {
                AutomationElement element = sender as AutomationElement;
                if (element != null)
                {
                    var bounds = element.Current.BoundingRectangle;
                    var aid = EscapeJson(element.Current.AutomationId);
                    var name = EscapeJson(element.Current.Name);
                    var className = EscapeJson(element.Current.ClassName);
                    var ctype = EscapeJson(element.Current.ControlType.ProgrammaticName);
                    
                    string json = string.Format(
                        "{{\"type\":\"FocusChanged\",\"automationId\":\"{0}\",\"name\":\"{1}\",\"className\":\"{2}\",\"controlType\":\"{3}\",\"bounds\":{{\"x\":{4},\"y\":{5},\"width\":{6},\"height\":{7}}}}}",
                        aid, name, className, ctype,
                        bounds.X, bounds.Y, bounds.Width, bounds.Height
                    );

                    Console.WriteLine(json);
                }
            }
            catch (Exception)
            {
                // Ignore transient errors
            }
        }
    }
}
